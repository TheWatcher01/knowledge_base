from pathlib import Path
import json

from rag_api.api import create_app
from fastapi.openapi.utils import get_openapi


def main() -> None:
    app = create_app()
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    output = Path(__file__).resolve().parent.parent / "openapi.json"
    output.write_text(json.dumps(schema, indent=2) + "\n", encoding="utf-8")
    print(f"OpenAPI schema written to {output}")


if __name__ == "__main__":
    main()
