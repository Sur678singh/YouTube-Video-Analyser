from langchain_huggingface.embeddings import HuggingFaceEndpointEmbeddings
from dotenv import load_dotenv
from langchain_huggingface import ChatHuggingFace,HuggingFaceEndpoint
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from youtube_transcript_api import YouTubeTranscriptApi,TranscriptsDisabled
from langchain_core.runnables import RunnablePassthrough,RunnableParallel,RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

#******************************** loadenv file**********************************************
load_dotenv()

# ******************************** Fast API Backend ****************************************
app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# *********************************Serve Frontend UI****************************
app.mount("/public",StaticFiles(directory='public'),name='public')
# get request from server
@app.get("/")
def serve_frontend():
    return FileResponse("public/index.html")

# ********************************* embedding model******************************************
embedding_model=HuggingFaceEndpointEmbeddings(model='sentence-transformers/all-MiniLM-L6-v2')

#********************************* llm model *************************************************
model=HuggingFaceEndpoint(model='mistralai/Mistral-7B-Instruct-v0.2',task='text-generation')
llm=ChatHuggingFace(llm=model)

#******************************** Step1a:Indexing(data ingestion)*****************************
# load data from youtube
video_id='SJKr7BPOXY0' # only relevant path not description like id
try:
    # it choose best language foe us
    transcript_list=YouTubeTranscriptApi().fetch(video_id=video_id,languages=['en'])

    # flatten to plain text
    transcript=" ".join(chunk.text for chunk in transcript_list)
    # print(transcript)

except TranscriptsDisabled:
    print('No Caption Available')

#*********************************** step1b:Indexing(text Splitting)*****************************
spltter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=50)
chunks=spltter.create_documents([transcript])
# print(chunks[10].page_content)
print(len(chunks))

#************************************* step1c:Indexing(embedding)**********************************
vector_Store=FAISS.from_documents(documents=chunks,embedding=embedding_model)
vector_Store.index_to_docstore_id
# get chunks through ids
vector_Store.get_by_ids(['74e8e9aa-f1ad-4f11-8ba8-8fd2377202e4'])

#************************************** step2:Retreiver*********************************************
# built a retreiver through vector store
retreiver=vector_Store.as_retriever(search_type='similarity',search_kwargs={'k':3})

#*************************************** generate a query********************************************
retreiver.invoke('what author said throughout video?')

#*************************************** step3:Augmentation*******************************************
# crate a simple template for query 
prompt=PromptTemplate(
    template='''You are a helpful Assitent.
    Answer only from the privided context.if the context is not sufficient,then you say you don't know.
    {context}
    question:{question}
    ''',
    input_variables=['context','question']
)

#******************************************* genearete a question**************************************
question='Is the main guy is right path to decide in video? if yes give me short explaination?'
retreiver_docs=retreiver.invoke(question)

# context
def format_docs(retreiver_docs):
    context_text='\n\n'.join(doc.page_content for doc in retreiver_docs)
    return context_text

parser=StrOutputParser()

#******************************************** final stage Build a chain*********************************
parelle_chain=RunnableParallel({
    'context':retreiver|RunnableLambda(format_docs),
    'question':RunnablePassthrough()
})

main_chain=parelle_chain|prompt|llm|parser

# ******************************************* connect backend*******************************************
# post request
class Query(BaseModel):
    video_id: str
    question: str

def get_chain(video_id):
    try:
        transcript_list = YouTubeTranscriptApi().fetch(video_id=video_id, languages=['en'])
        transcript = " ".join(chunk.text for chunk in transcript_list)
    except:
        return None, "No transcript available"

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=50)
    chunks = splitter.create_documents([transcript])

    vector_store = FAISS.from_documents(chunks, embedding_model)
    retriever = vector_store.as_retriever(search_kwargs={'k': 3})

    return retriever, None


@app.post("/ask")
def ask(q: Query):
    try:
        retriever, error = get_chain(q.video_id)

        if error:
            return {"answer": error, "sources": []}

        docs = retriever.invoke(q.question)

        context = "\n\n".join(doc.page_content for doc in docs)

        result = llm.invoke(f"""
        Answer only from the context.
        Context:
        {context}

        Question: {q.question}
        """)

        return {
            "answer": result.content,
            "sources": [doc.page_content[:150] for doc in docs]
        }

    except Exception as e:
        return {"answer": str(e), "sources": []}
    