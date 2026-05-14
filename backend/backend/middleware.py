class SearchRobotsTagMiddleware:
    """
    Keep utility and private endpoints out of search engine indexes.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        path = request.path or ""

        if path.startswith("/api/") or path.startswith("/admin/"):
            response["X-Robots-Tag"] = "noindex, nofollow, noarchive, nosnippet"

        return response
