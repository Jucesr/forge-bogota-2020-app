import React, { useState, useEffect } from 'react'
import { Icon, Button, Select, Table, Input} from 'semantic-ui-react'
import PropTypes from 'prop-types'

const FamiliesList = (props) => {
   const { items } = props
   const mats = ['Plastic', 'Steel', 'Brick', 'CMU', 'Concrete Precast', 'Metal', 'Glass']
   const materialOptions = mats.map(m => ({
      key: m,
      value: m,
      text: m
   }))

   return (
      <div>
         <Table celled>
               <Table.Header>
                  <Table.Row>
                     {/* <Table.HeaderCell>Actions</Table.HeaderCell> */}
                     <Table.HeaderCell>Name</Table.HeaderCell>
                     <Table.HeaderCell>Thickness</Table.HeaderCell>
                     <Table.HeaderCell>Material</Table.HeaderCell>
                  </Table.Row>
               </Table.Header>

               <Table.Body>
                  {items.map((item, index) => (
                     <Table.Row key={index} >
                        <Table.Cell><Input fluid value={item.name} onChange={(e) => {
                           const value = e.target.value;
                           props.updateItem({
                              ...item,
                              name: value
                           })
                        }} /></Table.Cell>
                        <Table.Cell><Input fluid value={item.thicknes} onChange={(e) => {
                           const value = e.target.value;
                           props.updateItem({
                              ...item,
                              thicknes: value
                           })
                        }} /></Table.Cell>
                        <Table.Cell>
                           <Select 
                              placeholder='Select Material' 
                              options={materialOptions} 
                              value={item.material} 
                              onChange={(e) => {
                                 const value = e.target.innerText;
                                 props.updateItem({
                                    ...item,
                                    material: value
                                 })
                              }}
                           />
                        </Table.Cell>
                     </Table.Row>
                  ))}

               </Table.Body>
               <Table.Footer>
                  <Table.Row>
                     <Table.HeaderCell colSpan='4'>
                        <Button color="green" fluid icon labelPosition='right' onClick={() => props.addItem()}>
                           Add Type
                        <Icon name='plus' />
                        </Button>
                     </Table.HeaderCell>
                  </Table.Row>
               </Table.Footer>
            </Table>
      </div>
   )
}

FamiliesList.propTypes = {

}

export default FamiliesList