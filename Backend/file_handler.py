from Backend.config import ALLOWED_EXTENSIONS, MAX_CONTENT_LENGTH


def is_allowed_file(filename: str) -> bool:
    return bool(filename) and "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def read_uploaded_log(uploaded_file):
    if uploaded_file is None or uploaded_file.filename == "":
        raise ValueError("No file was uploaded. Attach a .log or .txt file.")
    if not is_allowed_file(uploaded_file.filename):
        raise ValueError("Unsupported file type. Use .log or .txt.")

    file_content = uploaded_file.stream.read()
    if not file_content:
        raise ValueError("Uploaded file is empty.")

    if isinstance(file_content, bytes):
        file_text = file_content.decode("utf-8", errors="replace")
    else:
        file_text = str(file_content)

    if len(file_text.encode("utf-8")) > MAX_CONTENT_LENGTH:
        raise ValueError("Uploaded file exceeds the allowed size limit.")

    return file_text
