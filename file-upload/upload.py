from llama_index.core import SimpleDirectoryReader
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.schema import TextNode
from pinecone import Pinecone, ServerlessSpec
from llama_index.embeddings.openai import OpenAIEmbedding

embed_model = OpenAIEmbedding(model="text-embedding-3-small", api_key='', dimensions=1536)

pinecone_api_key = ''
pinecone_environment = 'us-east1-gcp'
pc = Pinecone(api_key=pinecone_api_key)

index_name = 'ask-altman'
# pc.create_index(index_name, dimension=1536, metric="euclidean", spec=ServerlessSpec(
#     cloud="aws",
#     region="us-west-2"
#   ) )


pinecone_index = pc.Index(index_name)



vector_store = PineconeVectorStore(pinecone_index=pinecone_index)

reader = SimpleDirectoryReader("./txts")

text_splitter = SentenceSplitter(
    chunk_size=280,
    chunk_overlap=50,
    separator=" ",
)

nodes = []

for docs in reader.iter_data():
    cur_doc = docs[0]
    cur_text_chunks = text_splitter.split_text(cur_doc.text)

    for text_chunk in cur_text_chunks:
        cur_node = TextNode(text=text_chunk)
        file_name, timestamp = cur_doc.metadata['file_name'][:-4].rsplit("(", 1)
        cur_node.metadata['file_name'] = file_name.strip()
        cur_node.metadata['timestamp'] = timestamp.rstrip(")")
        nodes.append(cur_node)
        

for node in nodes:
    node_embedding = embed_model.get_text_embedding(
        node.get_content(metadata_mode="all")
    )
    node.embedding = node_embedding

vector_store.add(nodes)