from fastapi import FastAPI

app = FastAPI(
    title="Apex Logic API",
    description="Інтелектуальний диспетчерський хаб (Хакатон Innovate)",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"message": "Apex Logic Core is running! 🚀"}