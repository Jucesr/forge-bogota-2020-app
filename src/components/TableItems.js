import React, { useState } from 'react'
import { Icon, Button, Select, Table, Dimmer, Loader } from 'semantic-ui-react'
import faker from 'faker'

import { callApi } from "../utils/api";

const TableItems = (props) => {
   const { items, families, viewer } = props

   const [itemSelected, setItemSelected] = useState(undefined)
   const [isAllVisible, setIsAllVisible] = useState(false)
   const [isLoading, setIsLoading] = useState(false)

   const familyOptions = families.map(fam => ({
      key: fam.id,
      value: fam.id,
      text: fam.name
   }))

   const toggleAllLines = () => {
      const measureExtension = viewer.getExtension('Autodesk.Measure');
      measureExtension.deactivate()
      measureExtension.activate();
      measureExtension.deleteCurrentMeasurement();
      if(!isAllVisible){
         // Get all measurement from all wall types
         const allMeasurements = items.reduce((acum, i) => {
            return [
               ...acum,
               ...i.measurementList
            ]
         }, [])
         measureExtension.setMeasurements(allMeasurements);
         setIsAllVisible(true)
      }else{
         measureExtension.setMeasurements([]);
         setIsAllVisible(false)
      }
      

   }

   const onItemClick = (item) => {
      const measureExtension = viewer.getExtension('Autodesk.Measure');
      measureExtension.deactivate()
      measureExtension.activate();
      measureExtension.deleteCurrentMeasurement();
      if (itemSelected === item.id) {
         // It's already selected, clean the Viewer
         measureExtension.setMeasurements([]);
         measureExtension.deleteCurrentMeasurement()
         setItemSelected(undefined)
      } else {
         measureExtension.setMeasurements(item.measurementList);
         measureExtension.deleteCurrentMeasurement()
         setItemSelected(item.id)
      }
   }

   const onItemSave = (item) => {
      const measureExtension = viewer.getExtension('Autodesk.Measure');
      let data = measureExtension.getMeasurementList()

      //  Add the color if any
      data = data.map((dataItem, index) => {
         return {
            ...dataItem,
            lineColor: item.color.substring(1)
         }
      })

      props.saveItem({
         ...item,
         measurementList: data
      })
      measureExtension.deactivate();
      setItemSelected(undefined)

   }


   const getDistance = (measurementList) => {
      if (measurementList.length == 0)
         return "0 m";

      let distanceTotal = measurementList.reduce((acum, measureItem) => {
         let parseDistance = parseFloat(measureItem.distance.substring(0, measureItem.distance.length - 2))
         return acum + parseDistance;
      }, 0)

      distanceTotal = Math.round((distanceTotal + Number.EPSILON) * 100) / 100

      return `${distanceTotal} m`
   }

   const addNewMeasure = () => {
      props.addItem({
         id: items.length + 1,
         number: items.length + 1,
         color: faker.internet.color(),
         measurementList: []
      })
   }

   const loadCalibration = () => {
      const measureExtension = viewer.getExtension('Autodesk.Measure');
      measureExtension.calibrateByScale("m", 140);
   }

   const generate3DModel = async () => {
      // Combine walls and families
      setIsLoading(true);
      props.setResultURN(undefined)
      const req = items.map(i => ({
         ...i,
         family: families.find(f => i.familyID === f.id)
      }))

      const response = await callApi(`/generate_model`, {
         method: 'POST',
         body: JSON.stringify(req)
      });
      setIsLoading(false);
      console.log(response)
      props.setResultURN(response.body.urn)

   }

   const saveItems = async () => {
      const req = items.map(i => ({
         ...i,
         family: families.find(f => i.familyID === f.id)
      }))
      const response = await callApi(`/save`, {
         method: 'POST',
         body: JSON.stringify(req)
      });
      alert(response.body.message)
   }

   return (
      <div className="TableItems">
         <div className="TableItemsCard">
         <Dimmer active={isLoading}>
            <Loader>Loading</Loader>
         </Dimmer>
            <div style={{display: 'flex'}}>
               {/* <Button onClick={loadCalibration}>Load Calibration</Button> */}
               <Button color="yellow" fluid icon labelPosition='right' onClick={loadCalibration}>
                  Calibrate
                  <Icon name='calculator' />
               </Button>
               <Button color="blue" fluid icon labelPosition='right' onClick={() => props.openSettings()}>
                  Manage Types
                  <Icon name='settings' />
               </Button>
               <Button color="teal" fluid icon labelPosition='right' onClick={generate3DModel}>
                  Generate Model
                  <Icon name='cube' />
               </Button>
               <Button color={ isAllVisible ? 'red' : 'green' }fluid icon labelPosition='right' onClick={toggleAllLines}>
                  { isAllVisible ? 'Hide All' : 'Show All' }
                  <Icon name='eye' />
               </Button>

               <Button color="teal" fluid icon labelPosition='right' onClick={saveItems}>
                  Save
                  <Icon name='save' />
               </Button>
            </div>

            <Table celled>
               <Table.Header>
                  <Table.Row>
                     <Table.HeaderCell>Action</Table.HeaderCell>
                     <Table.HeaderCell>Color</Table.HeaderCell>
                     <Table.HeaderCell>Type</Table.HeaderCell>
                     <Table.HeaderCell>Distance</Table.HeaderCell>
                  </Table.Row>
               </Table.Header>

               <Table.Body>
                  {items.map((item, index) => (
                     <Table.Row key={index} >
                        <Table.Cell>
                           {
                              itemSelected === item.id ? (
                                 <Button onClick={() => onItemSave(item)} icon><Icon name='save' /></Button>
                              ) : (
                                    <Button onClick={() => onItemClick(item)} icon><Icon name='edit' /></Button>
                                 )
                           }
                           <Button onClick={() => props.onDeleteItem(item)} icon><Icon name='trash' /></Button>
                        </Table.Cell>
                        <Table.Cell><Icon name="circle" style={{ color: item.color }}></Icon></Table.Cell>
                        <Table.Cell>
                           <Select 
                              placeholder='Select your country' 
                              options={familyOptions} 
                              value={item.familyID} 
                              onChange={(e) => {
                                 const value = e.target.innerText;
                                 const family = families.find(f => f.name === value);
                                 props.saveItem({
                                    ...item,
                                    familyID: family.id
                                 })
                              }}
                           />
                        </Table.Cell>
                        <Table.Cell>{getDistance(item.measurementList)}</Table.Cell>
                     </Table.Row>
                  ))}

               </Table.Body>
               <Table.Footer>
                  <Table.Row>
                     <Table.HeaderCell colSpan='4'>
                        <Button color="green" fluid icon labelPosition='right' onClick={addNewMeasure}>
                           Add Measurement
               <Icon name='plus' />
                        </Button>
                     </Table.HeaderCell>
                  </Table.Row>
               </Table.Footer>
            </Table>
         </div>

      </div>
   )
}

export default TableItems