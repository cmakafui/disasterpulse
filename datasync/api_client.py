import httpx
from typing import Dict, Any

class APIClient:
    """
    A client for making asynchronous HTTP requests to a specified base URL.
    """

    def __init__(self, base_url: str, app_name: str):
        """
        Initialize the API client.

        :param base_url: The base URL for the API.
        :param app_name: The application name to be used in the API requests.
        """
        self.base_url = base_url
        self.app_name = app_name
        self.client = httpx.AsyncClient()

    async def post(self, endpoint: str, json: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Make a POST request to the specified endpoint.

        :param endpoint: The API endpoint to post to.
        :param json: The JSON payload to send with the request.
        :return: The JSON response from the API.
        """
        url = f"{self.base_url}/{endpoint}?appname={self.app_name}"
        response = await self.client.post(url, json=json)
        response.raise_for_status()
        return response.json()

    async def close(self):
        """
        Close the HTTP client.
        """
        await self.client.aclose()