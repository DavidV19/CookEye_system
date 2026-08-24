import json
import time
from typing import Iterator, Dict

def stream_from_jsonl(path: str, delay_ms: int = 50) -> Iterator[Dict]:
    """
    Simula un stream leyendo un archivo JSONL (1 JSON por línea).
    delay_ms controla cada cuánto "llega" un evento (como si fuera streaming).
    """
    with open(path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue

            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                # Si hay una línea corrupta, la saltamos (simulación realista)
                print(f"[WARN] Línea {line_num} inválida, se ignora.")
                continue

            yield event
            time.sleep(delay_ms / 1000.0)


if __name__ == "__main__":
    FILE_PATH = "data_stream.jsonl"

    for event in stream_from_jsonl(FILE_PATH, delay_ms=30):
        # Aquí normalmente lo enviarías a tu pipeline/cola
        print(event)
