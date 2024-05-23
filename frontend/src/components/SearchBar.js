import React, { useState, useEffect } from 'react';
import SourceList from './sourceList';
import { RedWarningTrianlge } from './warningTriangles';
import { NavArrowDown } from 'iconoir-react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function SearchBar({ recommendations = [] }) {
    const [query, setQuery] = useState('');
    const [spinner, setSpinner] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [pongoSources, setPongoSources] = useState([]);
    const [pongoAnswer, setPongoAnswer] = useState('');
    const [shouldDisplay, setShouldDisplay] = useState(false);
    const [pongoSocket, setPongoSocket] = useState(null);
    const [socketHasClosed, setSocketHasClosed] = useState(false);


    const SOCKET_URL = 'wss://smpl-backend.joinpongo.com/sockets/sam';


    useEffect(() => {
        const newPSocket = new WebSocket(SOCKET_URL);

        newPSocket.onopen = () => setSocketHasClosed(false);
        setPongoSocket(newPSocket);

        newPSocket.onmessage = (event) => {
            if (event.data.startsWith("JSON_STRING:")) {
                const data = JSON.parse(event.data.substring("JSON_STRING:".length));
                setPongoSources(data);
            } else {
                setPongoAnswer((prev) => prev + event.data);
            }
        };

        newPSocket.onclose = () => {
            setSocketHasClosed(true);
        };
    }, []);



    async function search(event, inputQuery = query) {
        if (event !== 'no-event') {
            event.preventDefault();
        }
        setSpinner(true);
        setError(false);
        setErrorMessage("");
        setShouldDisplay(true);
        setPongoAnswer('');

        pongoSocket.send(inputQuery);
        setSpinner(false);
    }

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    return (
        <div className='md:w-full mx-auto pb-10 w-[95vw]'>
            <div className='w-full flex flex-col'>
                <div className='flex w-full sm:px-10 py-2 mx-auto flex-col'>
                    <div className='flex'>
                        {socketHasClosed ? (
                            <div className='text-red-500 flex items-center w-fit h-fit mb-1 mt-auto'>
                                <div className='w-4 h-4 mr-1 mt-0.5'>
                                    <RedWarningTrianlge />
                                </div>
                                <div className='flex sm:text-md text-sm items-center text-right'>
                                    Connection to server lost, please refresh the page
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <div className="flex items-center align-middle">
                        <form className='w-full flex'>
                            <input
                                className="h-11 flex items-center border-none outline-none focus: w-full text-white mr-3 py-3 px-4 bg-zinc-700 shadow-md rounded-none leading-tight focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                                type="text"
                                value={query}
                                id='search-bar-'
                                onChange={handleChange}
                                placeholder="Search..."
                            />
                            <button
                                className="bg-indigo-600 text-white px-4 py-2 rounded-none"
                                type="submit"
                                onClick={search}
                            >
                                Search
                            </button>
                        </form>
                    </div>
                    {recommendations.length > 0 && <div className='w-full flex justify-evenly items-stretch sm:flex-row mt-4 md:mt-4'>
                {recommendations.map((item, idx) => {
                    return <div key={idx} className='cursor-pointer w-fit rounded-none py-1.5 md:py-2 px-2 md:px-3 shadow-md text-white bg-zinc-600 text-medium mx-3 sm:mt-0 text-xs md:text-base' onClick={()=>{setQuery(item);}}>
                        {item}
                    </div>
                })}
                

                </div>}
                    {spinner && <div className="spinner">Loading...</div>}
                    {error && <div className="error">{errorMessage}</div>}
                    {shouldDisplay && (
                        <div className="mt-6">
                            <div className="answer mb-6">
                            <ReactMarkdown
                            remarkPlugins={[remarkGfm]}

                            components={{
                                // Use Tailwind CSS classes to style the HTML elements
                                h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-4 text-zinc-50" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-xl font-medium my-3 text-zinc-50" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-xl my-2 text-zinc-50" {...props} />,
                                h4: ({ node, ...props }) => <h4 className="text-lg font-medium my-1 text-zinc-50" {...props} />,
                                h5: ({ node, ...props }) => <h5 className="text-sm font-medium text-zinc-50" {...props} />,
                                h6: ({ node, ...props }) => <h6 className="text-xs font-medium  text-zinc-50" {...props} />,
                                p: ({ node, ...props }) => <p className="text-base my-2 text-white " {...props} />,

                                a: ({ node, ...props }) =>
                                    <a target='_blank' className="text-zinc-50 font-mono hover:text-zinc-100 underline" {...props} />,


                                ul: ({ node, ...props }) => <ul className="list-disc pl-6 text-white" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 text-white " {...props} />,
                                li: ({ node, ...props }) => <li className="pl-1 py-0.5" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 pl-4 italic my-4 bg-zinc-800 text-zinc-100" {...props} />,
                                code: ({ node, ...props }) => <code className="py-1 rounded text-sm font-mono bg-zinc-800 text-zinc-100" {...props} />,
                                pre: ({ node, ...props }) => <pre className="py-2 px-4 rounded text-sm bg-zinc-800 text-zinc-100 overflow-x-auto" {...props} />,
                            }} >{pongoAnswer}</ReactMarkdown></div>
                            <SourceList sources={pongoSources} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
                               