import { ReactNode } from "react";

export const ColumnsContainer = ({id, children}: {id: string, children: ReactNode}) => {
  return (
    <div id={id} className='columns-container my-6 columns'>
      {/* <div className="col-span-1 col-end-2"></div> */}
      {children}
      {/* <div className="col-span-1 col-start-11"></div> */}
    </div>
  )
};
