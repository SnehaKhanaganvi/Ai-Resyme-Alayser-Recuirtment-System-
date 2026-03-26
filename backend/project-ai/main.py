from fastapi import FastAPI, UploadFile, File, Form
from ai_logic import extract_text_from_pdf, analyze_resume

app = FastAPI(title="AI Resume Analyzer API 🚀")


@app.get("/")
def home():
    return {"message": "AI Resume Analyzer Running 🚀"}


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        # Read file
        contents = await file.read()

        # Extract text
        resume_text = extract_text_from_pdf(file.file)

        # Analyze
        result = analyze_resume(resume_text, job_description)

        return {
            "message": "Analysis Complete",
            "data": result
        }

    except Exception as e:
        return {"error": str(e)}