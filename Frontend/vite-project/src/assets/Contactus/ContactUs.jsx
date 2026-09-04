import './Style.css';
import { FiPhone, FiMail, FiMapPin, FiTwitter, FiInstagram } from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';

const ContactPage = () => {
  return (
    <div className="contact-page-wrapper">
      <main className="contact-main">
        <div className="contact-header">
          <h2>Contact Us</h2>
          <p>Any question or remarks? Just write us a message!</p>
        </div>

        <div className="contact-card">
          {/* Left Column: Contact Information */}
          <div className="contact-info-panel">
            <div className="info-text-section">
              <h3>Contact Information</h3>
              <p>Say something to start a live chat!</p>
            </div>

            <div className="info-details-section">
              <div className="info-row">
                <FiPhone className="info-icon" />
                <span>+91 8866595339</span>
              </div>
              <div className="info-row">
                <FiMail className="info-icon" />
                <span>deepgoyani77@gmail.com</span>
              </div>
              <div className="info-row location-row">
                <FiMapPin className="info-icon" />
                <span>132 Dartmouth Street Boston,<br/>Massachusetts 02156 surat gujarat</span>
              </div>
            </div>

            <div className="social-row">
              <a href="#" className="social-btn"><FiTwitter /></a>
              <a href="#" className="social-btn"><FiInstagram /></a>
              <a href="#" className="social-btn"><FaDiscord /></a>
            </div>

            {/* Decorative background circles */}
            <div className="decor-circle large"></div>
            <div className="decor-circle small"></div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-panel">
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" placeholder="John" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" placeholder="Doe" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+91 8866595339" />
                </div>
              </div>

              <div className="form-group subject-group">
                <label className="subject-label">Select Subject?</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input type="radio" name="subject" defaultChecked />
                    <span className="radio-custom"></span>
                    General Inquiry
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="subject" />
                    <span className="radio-custom"></span>
                    General Inquiry
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="subject" />
                    <span className="radio-custom"></span>
                    General Inquiry
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="subject" />
                    <span className="radio-custom"></span>
                    General Inquiry
                  </label>
                </div>
              </div>

              <div className="form-group message-group">
                <label>Message</label>
                <textarea rows="3" placeholder="Write your message.."></textarea>
              </div>

              <div className="form-submit-row">
                <button type="submit" className="contact-submit-btn">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;