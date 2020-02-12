import React, { useState, useEffect } from 'react';
import data from "./data/data";
import familiesData from "./data/families";
import Viewer from "./components/Viewer";
import './App.css';

import Models from "./config/models";
import TableItems from './components/TableItems';
import Header from './components/Header';
import FamiliesList from './components/FamiliesList';
import ModelList from './components/ModelList';
import ConfirmModal from './components/ConfirmModal';

import { Modal, Dimmer, Loader, Sidebar, Segment, Menu } from 'semantic-ui-react'

import { callApi } from "./utils/api";

function App() {
  const [listVisible, setListVisible] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [viewer, setViewer] = useState(undefined)
  const [items, setItems] = useState(data)
  const [families, setFamilies] = useState(familiesData)
  const [isLoading, setIsLoading] = useState(undefined)
  const [history, setHistory] = useState([])
  const [modal, setModal] = useState({
    open: false
  })
  const [resultURN, setResultURN] = useState(undefined)


  const didMount = async () => {
    const response = await callApi(`/generations`);
    setHistory(response.body)
  }

  useEffect(didMount, [])

  const calibrate = () => {
    const measureExtension = viewer.getExtension('Autodesk.Measure');
    const factor = measureExtension.getCalibrationFactor();
    if (factor == null) {
      measureExtension.calibrateByScale("m", 95.62017133353991);
    }
  }

  const generate3DModel = async (name) => {

    const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

    //  Combine walls and families
    const req = items.map(i => ({
      ...i,
      family: families.find(f => i.familyID === f.id)
    }))

    //  Validate that it has at least one measuremnt and has a valid type.

    if(req.length == 0){
      alert('Add one measurement at least');
      return;
    }

    const allHaveFamily = req.reduce((acum, item) => item.family !== undefined && acum, true)

    if(!allHaveFamily){
      alert('Some measurements do not have type');
      return;
    }

    setIsLoading('Using Design Automation to generate RVT..');
    setResultURN(undefined)


    //  Call DA
    const response = await callApi(`/generate_model`, {
       method: 'POST',
       body: JSON.stringify(req)
    });

    const { item_id, version_url, urn } = response.body;
    let status;
    //  Check status every 2 seconds.
    //  TODO: Use hooks.
    do {
       const { body } = await callApi(`/model_status`, {
          method: 'GET',
          params: {
             version_url
          }
       });
       status = body.status
       setIsLoading(`Using Model derivative to convert result. Status: ${status}`);
       await sleep(2000)
    } while (status !== 'PROCESSING_COMPLETE');
    
    //  Add it to history
    setIsLoading(`Done.. preparing model`);
    const gen = await callApi(`/generation`, {
       method: 'POST',
       body: JSON.stringify({
          name: name,
          lines: items,
          families,
          urn
       })
    });
    setHistory([
      ...history,
      gen.body
    ])
    setIsLoading(undefined);
    setResultURN(urn)

 }

  const models = Models["b.6eec3ddb-4f30-44e2-a969-3652fda82609"];
  return (
    <Sidebar.Pushable as={Segment}>
      <Sidebar
        // animation='overlay'
        // icon='labeled'
        // inverted
        onHide={() => setListVisible(false)}
        vertical
        visible={listVisible}
        width='very wide'
        direction="right"
      >
        <ModelList
          onClickItem={(item) => {
            setListVisible(false);
            setFamilies(item.families);
            setItems(item.lines);
            setResultURN(item.urn)
          }} 
          items={history}>

        </ModelList>
      </Sidebar>

      <Sidebar.Pusher dimmed={listVisible}>
        <div className="container">
          <div className="Header-Container">
            <div className="Header">
              <Header
                viewer={viewer}
                items={items}
                families={families}
                setResultURN={setResultURN}
                setIsLoading={setIsLoading}
                calibrate={calibrate}
                setListVisible={setListVisible}
                setConfirm={setConfirm}
                openSettings={() => {
                  setModal({
                    open: true
                  })
                }}
              />
            </div>
          </div>
          <div className="Body-Container">
            <div className="container-view" style={{ width: resultURN ? '35%' : '70%' }}>
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
            {resultURN && <div className="container-view" style={{ width: '35%' }}>
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
              calibrate={calibrate}
              onDeleteItem={(i) => {
                setItems(items.filter(item => item.id !== i.id))
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

          <Modal open={modal.open} onClose={() => setModal({ open: false })}>
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

          <Dimmer active={isLoading !== undefined}>
            <Loader>{isLoading}</Loader>
          </Dimmer>

          <ConfirmModal
              confirmButton="Continue"
              cancelButton="Cancel"
              header="Do you want to generate a 3D model?"
              open={confirm}
              confirmPlaceholderText='Type your name'
              onCancel={() => setConfirm(false)}
              onConfirm={name => {
                setConfirm(false);
                generate3DModel(name);
              }}
          />
        </div>
      </Sidebar.Pusher>
    </Sidebar.Pushable>


  );
}

export default App;
