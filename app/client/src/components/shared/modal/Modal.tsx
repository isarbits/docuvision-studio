import React from 'react';
import ReactModal from 'react-modal';
import './modal.scss';

interface Props extends ReactModal.props {
    onRequestClose: () => void;
    isOpen?: boolean;
    className?: string;
}

interface State {}

export class Modal extends React.Component<Props, State> {
    render() {
        return (
            <ReactModal
                {...this.props}
                closeTimeoutMS={200}
                style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' } }}
                contentLabel="modal"
            >
                <div className="modal-content-inner flex-column">
                    <div className="flex-grow">{this.props.children}</div>
                    <div className="actions">
                        <button onClick={this.props.onRequestClose}>close</button>
                    </div>
                </div>
            </ReactModal>
        );
    }
}
