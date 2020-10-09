import React from 'react';
import './Faq.scss';
import FaqSingleItem from '../components/faq/FaqSingleItem';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Faq extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            openedItem: 0
        };
        this.faqItemClicked = this.faqItemClicked.bind(this);
    }

    getFaqItems () {
        return [
            {
                'title': 'How is the tracking accomplished?',
                'text': `<p>This is actually a common technique used by most tracking software. 
                            This is used by all big players like <code>Mailchimp</code>, <code>Mailgun</code>, and any other provide that gives you the tracking feature.
                            Even <code>Zoho</code> uses this in their campaign emails.</p>
                         <p>We simply insert an image inside your mail which when loaded, tells that the email has been read.</p>`
            },
            {
                'title': 'Sometimes a user has viewed an email but I can\'t see that in the list!',
                'text': `<p>As explained above, we insert an <code>1x1 px</code> image inside your email.
                            To be able to record if the email has been opened, that image will have to be loaded. 
                            So, a common scenario is if the recipient has turned off images for your emails then we won't be able to record it!</p>`
            },
            {
                'title': 'How accurately do you display the IP address, location etc?',
                'text': `<p>The techniques used to get this info is pretty standard.
                        If a person is behind a proxy, the IP address will obviously be wrong.
                        Similarly, there are limitations to get location, device info etc. Whatever info we can record, we are displaying to you!</p>`
            },
            {
                'title': 'Sometimes I get absolutely incorrect IP/location, why is that?',
                'text': `<p>Many email clients don't show images directly from our server(<em>for security reasons of course</em>).
                        Previously, <code>Gmail</code> used to do it, but <code>Zoho</code> also started the same some time back.
                        So, sometimes the images are loaded from their servers and served to your recipients, hence the location isn't the same as your recipients.</p>`
            },
            {
                'title': 'How do you handle replies?',
                'text': `<p>When you are in a reply thread or forwarding your emails, to prevent getting multiple views on a single mail, 
                            we remove the old trackers before inserting new ones.
                            <u>But the behaviour highly depends on the message being replied to and how the email clients sends the images in replies</u>.</p>`
            },
            {
                'title': 'Are you recording my email contents?',
                'text': `<p><strong>Certainly NOT!</strong>
                            We only record handful of data like the <code>To field</code>, <code>CC field</code>, <code>BCC field</code> and <code>Subject</code> of the email.
                            Without this information it will be hard to identify the email for you!</p>`
            },
            {
                'title': 'If I open my own email, I don\'t get a notification, why?',
                'text': `<p>If you are testing the functionality of the extension, I recommend you to open your emails in another browser, because we try not to count your own opening as a <em>'view'</em>.
                            If we were to record your own opens, it will be highly inaccurate!
                            If you think that is happening, do file a Bug Report on this please :)</p>`
            },
            {
                'title': 'Sometimes, I can\'t send an email because of your extension!',
                'text': `<p>While we try to test the functionality heavily before releasing, we can't anticipate all the variables like DNS failures etc.
                        If the extension is causing you trouble I will sincerely ask you to contact me and I will try to resolve your issue on an immediate basis.</p>`
            },
            {
                'title': 'What about Android, iOS apps?',
                'text': `<p>There is an Android app, but it's being revamped.
                            So far, we have not started work on an iOS app!</p>`
            }
        ];
    }

    faqItemClicked (index) {
        this.setState({ openedItem: index });
    }

    getFaqComponent () {
        return this.getFaqItems().map((obj, index) => {
            return (
                <FaqSingleItem
                  title={obj.title}
                  text={obj.text}
                  key={index}
                  listId={index}
                  clicked={this.faqItemClicked}
                  selected={index === this.state.openedItem}
                />
            );
        });
    }

    render () {
        return (
            <div className='col-12 tabContent'>
                <div className={'row justify-content-between'}>
                    <div className={'faqContainer'}>
                        <h3 className={'pageTitle col-12'}>
                            <FontAwesomeIcon icon={faQuestionCircle} className={'icon'} />
                            FAQ
                        </h3>
                        <div className={'col-12'}>
                            {this.getFaqComponent()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Faq;
