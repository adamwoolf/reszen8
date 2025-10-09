import React, { useState } from "react";
import Popup from "../../components/Popup/Popup";
import { useAuth } from "../../contexts/AuthContext";
import { FaFileDownload } from "react-icons/fa";
import "./InvoiceStyles.scss";
const InvoicePopup = () => {
  const { currentUser, signOutRedirect } = useAuth();
  if (!currentUser) return null;
  const invoices = currentUser?.invoices;
  const [show, setShow] = useState(false);

  const getDate = (timestamp) => {
    return new Date(timestamp).toDateString();
  };

  return (
    <>
      <button className='invoices-cta' onClick={() => setShow(true)}>
        view invoices
      </button>
      <Popup show={show} onClose={() => setShow(false)}>
        <h3>Recent Invoices</h3>
        <table className='invoice-table'>
          {invoices.map((invoice) => (
            <tr>
              <td>{getDate(invoice.created)}</td>
              <td>status: {invoice.status}</td>
              <td>{invoice.amount}</td>
              <td>
                <a target='_blank' href={invoice.invoicePdf}>
                  download pdf <FaFileDownload />
                </a>
              </td>
              <td>
                <a target='_blank' href={invoice.hostedInvoiceUrl}>
                  view in browser
                </a>
              </td>
            </tr>
          ))}
        </table>
      </Popup>
    </>
  );
};

export default InvoicePopup;
