export const ColumnsContainer = ({id, children}) => {
  return (
    <div id={id} className='columns-container my-6 columns'>
      {/* <div className="col-span-1 col-end-2"></div> */}
      {children}
      {/* <div className="col-span-1 col-start-11"></div> */}
    </div>
  )
};
