import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {Button, Input, Modal} from "semantic-ui-react";

const ConfirmModal = (props) => {
    const [confirmTextValue, setConfirmTextValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const {header, onCancel, onConfirm, open, cancelButton, confirmButton, confirmPlaceholderText} = props;

    const resetValues = () => {
        setConfirmTextValue('');
        setIsValid(false);
    };

    const onConfirmButton = () => {
        if (isValid && onConfirm) {
            resetValues();
            onConfirm(confirmTextValue);
        }
    };
    const onCancelButton = () => {
        resetValues();
        onCancel();
    };
    const onChangeInputConfirm = (e) => {
        const value = e.target.value;
        const isValid = value.length > 0;
        setConfirmTextValue(value);
        setIsValid(isValid);
    };

    return (
        <Modal className='confirm-modal'
               open={open}
               onClose={onCancel}>
            <Modal.Header>{header}</Modal.Header>
            <Modal.Content>
                <Input focus placeholder={confirmPlaceholderText} fluid
                       value={confirmTextValue}
                       onChange={onChangeInputConfirm}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onCancelButton}>{cancelButton}</Button>
                <Button color='blue' onClick={onConfirmButton} disabled={!isValid}>
                    {confirmButton}
                </Button>
            </Modal.Actions>
        </Modal>
    )
};

ConfirmModal.propTypes = {
    open: PropTypes.bool.isRequired,
    confirmPlaceholderText: PropTypes.string,
    cancelButton: PropTypes.string,
    confirmButton: PropTypes.string,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
};

export default ConfirmModal;