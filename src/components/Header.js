import React, { useState, useEffect } from 'react'
import { Icon, Button } from 'semantic-ui-react'

const Header = (props) => {

   const {
      openSettings,
      setListVisible,
      items,
      viewer,
      calibrate
   } = props;

   const [isAllVisible, setIsAllVisible] = useState(false)

   const toggleAllLines = () => {
      calibrate();
      const measureExtension = viewer.getExtension('Autodesk.Measure');
      measureExtension.deactivate()
      measureExtension.activate();
      measureExtension.deleteCurrentMeasurement();

      if (!isAllVisible) {
         // Get all measurement from all wall types
         const allMeasurements = items.reduce((acum, i) => {
            return [
               ...acum,
               ...i.measurementList
            ]
         }, [])
         measureExtension.setMeasurements(allMeasurements);
         setIsAllVisible(true)
      } else {
         measureExtension.setMeasurements([]);
         setIsAllVisible(false)
      }


   }

   return (
      <div className="Header-Body">
         <section>
            <div className="Header-Title">
               Forge Revit Wall Generator
            </div>
            <Button color="blue" icon labelPosition='right' onClick={() => openSettings()}>
               Manage Wall Types
                  <Icon name='settings' />
            </Button>
            <Button color="teal" icon labelPosition='right' onClick={() => props.setConfirm(true)}>
               Generate Model
                  <Icon name='cube' />
            </Button>
            <Button color={isAllVisible ? 'red' : 'green'} icon labelPosition='right' onClick={toggleAllLines}>
               {isAllVisible ? 'Hide all' : 'Show all'} measurements
               <Icon name='eye' />
            </Button>
         </section>
         <section>

            <Button color="teal" icon labelPosition='right' onClick={() => setListVisible(true)}>
               History
               <Icon name='time' />
            </Button>
         </section>
      </div>
   )
}

export default Header