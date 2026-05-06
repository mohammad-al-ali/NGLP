from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import shutil
import os

app = FastAPI()

# 1. إعداد النموذج
# اخترنا "base.en" للغة الإنجليزية. عند التشغيل لأول مرة سيقوم بتحميله وحفظه محلياً.
model_size = "base.en"

print("⏳ جاري تجهيز نموذج الذكاء الاصطناعي (أو تحميله إذا كانت هذه أول مرة)...")
# int8 و cpu تضمنان أن يعمل النموذج بكفاءة عالية على المعالجات العادية دون استهلاك الذاكرة
model = WhisperModel(model_size, device="cpu", compute_type="int8")
print("✅ النموذج جاهز لاستقبال الفيديوهات!")

@app.post("/transcribe")
async def transcribe_video(file: UploadFile = File(...)):
    # 2. إنشاء مسار لملف مؤقت لحفظ الفيديو القادم من Spring Boot
    temp_file_path = f"temp_{file.filename}"
    
    # حفظ الملف في الجهاز مؤقتاً
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 3. تشغيل سحر الذكاء الاصطناعي لاستخراج النص والتوقيت
        segments, info = model.transcribe(temp_file_path, beam_size=5)

        results = []
        for segment in segments:
            results.append({
                "start": int(segment.start),  # وقت البداية بالثواني
                "end": int(segment.end),      # وقت النهاية بالثواني
                "text": segment.text.strip()  # النص
            })

        # 4. تنظيف وحذف الملف المؤقت
        os.remove(temp_file_path)

        # 5. إرجاع النتيجة كـ JSON نظيف يفهمه Spring Boot
        return {"transcription": results}

    except Exception as e:
        # في حال حدوث خطأ، نتأكد من حذف الملف المؤقت
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        return {"error": str(e)
}


#to run this Service "python -m uvicorn server:app --port 8000"