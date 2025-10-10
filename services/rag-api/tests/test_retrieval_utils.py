from rag_api.routes.retrieval import _hash_document_id


def test_hash_document_id_is_deterministic():
    url = "https://example.org/resource"
    first = _hash_document_id(url)
    second = _hash_document_id(url)
    assert first == second
    assert first.startswith("url_")


def test_hash_document_id_differs_for_distinct_urls():
    id_a = _hash_document_id("https://example.org/a")
    id_b = _hash_document_id("https://example.org/b")
    assert id_a != id_b
