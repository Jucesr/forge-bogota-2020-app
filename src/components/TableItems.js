import React, { useState } from 'react'
import { Icon, Button, Select, Table, Dimmer, Loader } from 'semantic-ui-react'
import faker from 'faker'

import { callApi } from "../utils/api";

const TableItems = (props) => {
   const { items, families, viewer, calibrate } = props

   const [itemSelected, setItemSelected] = useState(undefined)

   const familyOptions = families.map(fam => ({
      key: fam.id,
      value: fam.id,
      text: fam.name
   }))

   const onItemClick = (item) => {
      calibrate();
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

      data = cleanMeasurementList(data, item);

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

   const cleanMeasurementList = (measurementList, item) => {
      // Check every measure item to see if the new measure is 10 times biger or lower. If so probably to the bug.
      return measurementList.map((measureItem, index) => {
         let oldMeasureItem = item.measurementList[index];

         if(oldMeasureItem == undefined){
            // There is no previous measure
            return measureItem;
         }

         let newDistance = parseFloat(measureItem.distance.substring(0, measureItem.distance.length - 2))
         let oldDistance = parseFloat(oldMeasureItem.distance.substring(0, oldMeasureItem.distance.length - 2))

         if(newDistance >= oldDistance * 10 ){
            // If so take the old distance
            measureItem.distance = oldMeasureItem.distance;
         }

         return measureItem;
      })

   }


   const getDistance = (measurementList) => {
      if (measurementList.length == 0)
         return 0;

      let distanceTotal = measurementList.reduce((acum, measureItem) => {
         let parseDistance = parseFloat(measureItem.distance.substring(0, measureItem.distance.length - 2))
         return acum + parseDistance;
      }, 0)

      distanceTotal = Math.round((distanceTotal + Number.EPSILON) * 100) / 100

      return distanceTotal;
   }

   const addNewMeasure = () => {
      props.addItem({
         id: items.length + 1,
         number: items.length + 1,
         color: faker.internet.color(),
         measurementList: []
      })
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
                     <Table.Row key={index} active={itemSelected === item.id} >
                        <Table.Cell>
                           {
                              itemSelected === item.id ? (
                                 <Button color="blue" onClick={() => onItemSave(item)} icon><Icon name='save' /></Button>
                              ) : (
                                    <Button onClick={() => onItemClick(item)} icon><Icon name='edit' /></Button>
                                 )
                           }
                           <Button onClick={() => props.onDeleteItem(item)} icon><Icon name='trash' /></Button>
                        </Table.Cell>
                        <Table.Cell><Icon name="circle" style={{ color: item.color }}></Icon></Table.Cell>
                        <Table.Cell>
                           <Select 
                              placeholder='Select a wall type' 
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
                        <Table.Cell>{`${getDistance(item.measurementList)} m`}</Table.Cell>
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
            <div className="TableItemsFooter">
               <div>
                  V1.0.0
               </div>
               <section>
                  Develop by <a href="https://www.linkedin.com/in/julio-ojeda-9640a9113/" target="_blank">Julio Ojeda</a> in <a href="http://autodeskcloudaccelerator.com/" target="_blank">Forge Accelerator Bogota 2020.</a>
               </section>
               </div>
         </div>
      </div>
   )
}

export default TableItems