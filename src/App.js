import React, { useState } from 'react';
import data from "./data/data";
import familiesData from "./data/families";
import Viewer from "./components/Viewer";
import './App.css';

import Models from "./config/models";
import TableItems from './components/TableItems';
import Header from './components/Header';
import FamiliesList from './components/FamiliesList';


import { Modal } from 'semantic-ui-react'

function App() {
  const [viewer, setViewer] = useState(undefined)
  const [items, setItems] = useState(data)
  const [families, setFamilies] = useState(familiesData)
  const [modal, setModal] = useState({
    open: false
  })

  const [resultURN, setResultURN] = useState(undefined)

  const models = Models["b.6eec3ddb-4f30-44e2-a969-3652fda82609"];
  return (
    <div className="container">
      {/* <div className="Header-Container">
        <div className="Header">
          <Header/>
        </div>
      </div> */}
      <div className="Body-Container">
        <div className="container-view" style={{width: resultURN ? '35%' : '70%'}}>
          <div className="Card" style={{ height: '95%' }}>
            <Viewer
              id="viewer1"
              // viewable={2}
              documentId="urn:dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLjlSZVhzanFGVFppX08xUFA3VFdCTHc/dmVyc2lvbj0x"
              models={models}
              onInit={viewer => {
                setViewer(viewer)
              }}
            />
          </div>
        </div>
        {resultURN && <div className="container-view" style={{width: '35%'}}>
          <div className="Card" style={{ height: '95%' }}>
            <Viewer
              id="viewer2"
              documentId={resultURN}
            />
          </div>
        </div>}
        <TableItems
          items={items}
          families={families}
          viewer={viewer}
          setResultURN={setResultURN}
          onDeleteItem={(i) => {
            setItems(items.filter(item => item.id !== i.id))
          }}
          openSettings={() => {
            setModal({
              open: true
            })
          }}
          addItem={(newItem) => {
            setItems([
              ...items,
              newItem
            ])
          }}
          saveItem={(newItem) => {
            setItems(items.map(item => {
              if (item.id === newItem.id) {
                return newItem
              } else {
                return item;
              }
            }))
          }}
        />
      </div>

      <Modal open={modal.open} onClose={() => setModal({open: false})}>
        <Modal.Content>
          <FamiliesList
            items={families}
            
            addItem={() => {
              setFamilies([
                ...families,
                {
                  id: families.length + 1,
                  name: '',
                  thicknes: '',
                  material: undefined
                }
              ])
            }}
            updateItem={(newItem) => {
              setFamilies(families.map(item => {
                if (item.id === newItem.id) {
                  return newItem
                } else {
                  return item;
                }
              }))
            }}
          />
        </Modal.Content>
      </Modal>
    </div>
  );
}

export default App;
