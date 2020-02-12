import React, { useState, useEffect } from 'react'
import moment from "moment";

const ModelList = (props) => {
   const { items, onClickItem} = props;
   return (
      <div>
         <div className="ModelListTitle">
            Click in an item to load the model
         </div>
         {items.map((item) => (
            <div className="ModelListItem" key={item._id} onClick={() => onClickItem(item)}>
               <div className="ModelListItemTime">
                  {moment(item.createdAt).calendar(null, {
                     sameElse: 'MMM DD, YYYY [at] HH:mm'
                  })}
               </div>
               <div className="ModelListItemDetail">
                  <section>
                     {item.name} 
                  </section>
                  <div>
                     {item.lines.length} measurements, {item.families.length} families. 
                  </div>
                  
               </div>


            </div>
         ))}
      </div>


   )
}

export default ModelList