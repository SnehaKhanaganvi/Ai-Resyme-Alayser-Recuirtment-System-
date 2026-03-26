import PyPDF2
import re

STOPWORDS = {"and", "or", "the", "is", "in", "on", "at", "a", "an", "to", "for", "with"}

def extract_text_from_pdf(file):
    text = ""
    reader = PyPDF2.PdfReader(file)

    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text()

    return text


def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z ]', ' ', text)
    words = text.split()
    return [w for w in words if w not in STOPWORDS]


def analyze_resume(resume_text, job_description):

    resume_words = clean_text(resume_text)
    job_words = clean_text(job_description)

    resume_set = set(resume_words)
    job_set = set(job_words)

    matched = resume_set.intersection(job_set)
    missing = job_set - resume_set

    keyword_score = (len(matched) / len(job_set)) * 100 if job_set else 0

    ats_score = 0
    if len(resume_words) > 200:
        ats_score += 20
    if len(matched) > 5:
        ats_score += 30
    if "experience" in resume_words:
        ats_score += 20
    if "project" in resume_words:
        ats_score += 20
    if "skill" in resume_words:
        ats_score += 10

    final_score = round((keyword_score * 0.7) + (ats_score * 0.3), 2)

    return {
        "final_score": final_score,
        "keyword_score": round(keyword_score, 2),
        "ats_score": ats_score,
        "matched_keywords": list(matched),
        "missing_keywords": list(missing)
    }