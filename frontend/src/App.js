import React from 'react';
import SearchBar from './components/SearchBar';

// const SOCKET_URL = 'wss://smpl-backend.joinpongo.com/sockets/test'




export default function App() {



  return (
    <div className="min-h-screen h-fit w-screen bg-zinc-900 flex flex-col text-white">
      <div className="flex pt-5 md:pt-3 px-5">
        <div className="mt-auto text-sm"><a href='https://github.com/PongoAI/samgpt' className="underline">View source code</a></div>
        <div className="ml-auto ">An experiment by <a href='https://joinpongo.com?utm_source=samgpt' className="underline">Pongo 🦧</a></div>
      </div>

      <div className='w-fit mx-auto pt-10 mb-2 text-4xl font-semibold'>SamGPT</div>
      <div className='w-fit mx-auto text-zinc-400 text-center max-w-[90vw] text-lg'>Chat with Sam Altman's interviews and talks</div>
      <SearchBar recommendations={["What are Sam's good habits?", 'What does Sam think of AGI', "When did sam work at Y Combinator?"]} skipCohere={true}/>




    </div>
  );
}
