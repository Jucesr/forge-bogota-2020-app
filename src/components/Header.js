import React, { useState, useEffect } from 'react'
import { Label } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const Header = (props) => {
   return (
      <div className="Header-Body">
         <div>
            <strong style={{marginRight: '.5rem'}}>Thickness</strong>
            <span>20cm</span>
         </div>
      </div>
   )
}

Header.propTypes = {

}

export default Header