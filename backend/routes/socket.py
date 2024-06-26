from fastapi import (
    APIRouter,
    WebSocket,
)

import json
from dotenv import load_dotenv
import os
import json
import pongo
from openai import OpenAI

from pinecone import Pinecone
socket_router = APIRouter()
load_dotenv()



together_client = OpenAI(api_key=os.environ.get("TOGETHER_API_KEY"), base_url='https://api.together.xyz/v1')
groq_client = OpenAI(api_key=os.environ.get("GROQ_API_KEY"), base_url='https://api.groq.com/openai/v1')
pongo_client = pongo.PongoClient(os.environ.get("PONGO_API_KEY"))

#In prod, just include names in your data base objs 
pinecone_api_key = os.environ.get("PINECONE_SECRET")
pinecone_environment = 'us-east1-gcp'
pc = Pinecone(api_key=pinecone_api_key)
pinecone_podcast_index = pc.Index('ask-altman')

oai_client = OpenAI(api_key=os.environ.get("OPENAI_APIKEY"))




@socket_router.websocket("/sockets/sam")
async def websocket_endpoint_sam(websocket: WebSocket):
    await websocket.accept()

    while True:
        message = await websocket.receive_text()

        vector = (
            oai_client.embeddings.create(
                input=message, model="text-embedding-3-small", dimensions=1536
            )
            .data[0]
            .embedding
        )
        docs = pinecone_podcast_index.query(
            vector=vector, include_metadata=True, top_k=100
        )

        docs_for_pongo = []  # cohere
        strings_list = []
        i = 0
        for doc in docs["matches"]:
            j_doc = json.loads(doc["metadata"]["_node_content"])

            docs_for_pongo.append(
                {
                    "text": j_doc["text"],
                    "metadata": {"Title": j_doc["metadata"]["file_name"]},
                    "id": i,
                }
            )
            i += 1

        pongo_response = pongo_client.filter(query=message, docs=docs_for_pongo, num_results=10).json()

        llm_prompt = (
            "Please use ONLY the snippets from interviews of Sam Altman at the bottom of this prompt to answer the following question.  If the question cannot be answered from the information provided, say so."
            + "\n"
            + 'Question: "'
            + message
            + '"'
            + "\n\n SOURCES: \n"
        )
        i = 1

        for res in pongo_response:
            file_name = res["metadata"]["Title"]#.replace(".txt", "")
            strings_list.append(f"Title: {file_name}\n\n{res['text']}")
            llm_prompt += f"Source {i} - Title: {file_name}\n\n{res['text']}\n\n\n"
            i += 1

        await websocket.send_text("JSON_STRING:" + json.dumps(strings_list))

        groq_completion = groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": llm_prompt}],
            stream=True,
            temperature=0.2,
        )

        if int(groq_completion.response.headers.get('x-ratelimit-remaining-tokens', 0)) > 500 and groq_completion.response.status_code != 429:
            completion_to_use = groq_completion
            
        
        else: #prefer groq, but fallback to together
            completion_to_use = together_client.chat.completions.create(
            model="META-LLAMA/LLAMA-3-70B-CHAT-HF",
            messages=[{"role": "user", "content": llm_prompt}],
            stream=True,
            temperature=0.2,
        )


        for chunk in completion_to_use:
            if isinstance(chunk.choices[0].delta.content, str):
                await websocket.send_text(chunk.choices[0].delta.content)
        

        
        
        



        

