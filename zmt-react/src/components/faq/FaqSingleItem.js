import React from 'react';
import './FaqSingleItem.scss';

class FaqSingleItem extends React.Component {
    constructor (props) {
        super(props);
        this.clickListener = this.clickListener.bind(this);
    }

    clickListener () {
        this.props.clicked(this.props.listId);
    }

    render () {
        return (
            <div className={`faqItem ${this.props.selected ? 'open' : ''}`}>
                <div className={'faqHead d-flex align-items-start justify-content-between'} onClick={this.clickListener}>
                    <span>{this.props.title}</span>
                    <div className={'arrow d-flex align-items-center justify-content-center'} />
                </div>
                <div className={'faqText'} dangerouslySetInnerHTML={{ __html: this.props.text }} />
            </div>
        );
    }
}

export default FaqSingleItem;
