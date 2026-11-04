"""Deployment regressions for assets GitHub Pages cannot proxy."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from io import BytesIO
from email.message import Message

spec = importlib.util.spec_from_file_location("export_assets", Path(__file__).with_name("export-static-assets.py"))
export_assets = importlib.util.module_from_spec(spec)
spec.loader.exec_module(export_assets)


class AssetExportTests(unittest.TestCase):
    def setUp(self):
        self.asset = {"url": "/__l5e/assets-v1/logo-id/logo.png", "original_filename": "logo.png", "size": 3, "content_type": "image/png"}

    def test_logo_is_written_at_its_original_url(self):
        response = BytesIO(b"png")
        response.headers = Message()
        response.headers["Content-Type"] = "image/png"
        with tempfile.TemporaryDirectory() as directory, patch.object(export_assets, "urlopen", return_value=response) as request:
            output = Path(directory)
            result = export_assets.export_asset(output, "https://media.example", self.asset)
            self.assertEqual(result, output / "__l5e/assets-v1/logo-id/logo.png")
            self.assertEqual(result.read_bytes(), b"png")
            request.assert_called_once()
            self.assertEqual(request.call_args.args[0].full_url, "https://media.example/__l5e/assets-v1/logo-id/logo.png")
            self.assertIn("Mozilla/5.0", request.call_args.args[0].get_header("User-agent"))
            self.assertEqual(request.call_args.kwargs["timeout"], 60)

    def test_html_error_pages_are_not_exported_as_images(self):
        def response(*args, **kwargs):
            value = BytesIO(b"png")
            value.headers = Message()
            value.headers["Content-Type"] = "text/html"
            return value
        with tempfile.TemporaryDirectory() as directory, patch.object(export_assets, "urlopen", side_effect=response), patch.object(export_assets.time, "sleep"):
            with self.assertRaises(RuntimeError):
                export_assets.export_asset(Path(directory), "https://media.example", self.asset)
            self.assertFalse((Path(directory) / self.asset["url"].lstrip("/")).exists())

    def test_paths_cannot_escape_the_site(self):
        for path in ["/__l5e/assets-v1/../../outside.png", "/__l5e/assets-v1/%2e%2e/outside.png", "https://other.example/logo.png"]:
            with self.subTest(path=path), self.assertRaises(ValueError):
                export_assets.asset_destination(Path("/tmp/site"), {"url": path})


if __name__ == "__main__":
    unittest.main()