#!/usr/bin/env python3
"""Valida las fichas de Mi Cita Ideal.

Revisa cada archivo de contenido/fichas/ contra contenido/esquema-ficha.json
y contra el catálogo de ebooks. Detecta nombres repetidos y muestra el avance
por ebook y categoría.

Uso:
    pip install jsonschema
    python3 scripts/validar_fichas.py
Devuelve código 1 si hay errores.
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

try:
    from jsonschema import Draft202012Validator
except ImportError:  # pragma: no cover
    sys.exit("Falta jsonschema: pip install jsonschema")

RAIZ = Path(__file__).resolve().parent.parent
CONTENIDO = RAIZ / "contenido"
FICHAS = CONTENIDO / "fichas"


def normalizar(texto: str) -> str:
    texto = unicodedata.normalize("NFKD", texto.lower())
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9 ]+", "", texto).strip()


def main() -> int:
    esquema = json.loads((CONTENIDO / "esquema-ficha.json").read_text(encoding="utf-8"))
    catalogo = json.loads((CONTENIDO / "catalogo-ebooks.json").read_text(encoding="utf-8"))
    validador = Draft202012Validator(esquema)

    categorias = {
        e["id"]: {c["id"]: c for c in e["categorias"]} for e in catalogo["ebooks"]
    }
    metas = {e["id"]: e["fichas"] for e in catalogo["ebooks"]}

    errores: list[str] = []
    nombres: dict[str, str] = {}
    avance: dict[str, Counter] = defaultdict(Counter)
    estados: Counter = Counter()

    archivos = sorted(FICHAS.glob("*.json"))
    for ruta in archivos:
        try:
            ficha = json.loads(ruta.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errores.append(f"{ruta.name}: JSON inválido ({exc})")
            continue

        for err in validador.iter_errors(ficha):
            lugar = "/".join(str(p) for p in err.absolute_path) or "(raíz)"
            errores.append(f"{ruta.name}: {lugar}: {err.message}")

        fid = ficha.get("id", "")
        if fid != ruta.stem:
            errores.append(f"{ruta.name}: el id '{fid}' no coincide con el nombre del archivo")
        ebook = ficha.get("ebook", "")
        if fid and ebook and not fid.startswith(ebook + "-"):
            errores.append(f"{ruta.name}: el id no empieza con el ebook '{ebook}'")

        cat = ficha.get("categoria", "")
        cats_ebook = categorias.get(ebook, {})
        if cats_ebook and cat not in cats_ebook:
            errores.append(f"{ruta.name}: la categoría '{cat}' no existe en el ebook '{ebook}'")
        elif cats_ebook:
            sub = cats_ebook[cat].get("subetapa")
            if sub and ficha.get("subetapa") != sub:
                errores.append(f"{ruta.name}: subetapa debería ser '{sub}'")

        clave = normalizar(ficha.get("nombre", ""))
        if clave in nombres:
            errores.append(f"{ruta.name}: nombre repetido con {nombres[clave]}")
        else:
            nombres[clave] = ruta.name

        avance[ebook][cat] += 1
        estados[ficha.get("estado", "?")] += 1

    print(f"Fichas leídas: {len(archivos)}  |  estados: {dict(estados)}")
    for e in catalogo["ebooks"]:
        total = sum(avance[e["id"]].values())
        print(f"\n{e['titulo_comercial']} ({e['id']}): {total}/{metas[e['id']]}")
        for c in e["categorias"]:
            n = avance[e["id"]][c["id"]]
            marca = "OK" if n == c["fichas"] else ("DE MÁS" if n > c["fichas"] else "")
            print(f"  - {c['nombre']}: {n}/{c['fichas']} {marca}".rstrip())

    if errores:
        print(f"\n{len(errores)} error(es):")
        for e in errores:
            print(f"  * {e}")
        return 1
    print("\nSin errores.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
