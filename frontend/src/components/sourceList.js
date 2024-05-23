import { NavArrowDown, NavArrowUp} from 'iconoir-react';
import { useState } from 'react';

export default function SourceList({sources=[]}) {

    const [sourcesOpen, setSourcesOpen] = useState(false)

    return <div>
        <div className='flex text-lg cursor-pointer w-fit  font-bold mt-2' onClick={() => {setSourcesOpen(!sourcesOpen)}}>
            Sources <div className='w-10 h-10 pt-0.5'>{sourcesOpen ?   <NavArrowUp/> : <NavArrowDown />}</div>
        </div>
{sources.length > 0 && sourcesOpen? <>
                        {sources.map((source, indx) => (

                                
                            <div key={indx} className='mx-auto bg-zinc-700 my-6 px-4 py-2 rounded-none whitespace-pre-line'>
                               <span className="text-lg font-medium">Source #{indx+1}<br></br></span>{source}
                            </div>))}
                    </> : <></>}
    </div>
}
