import React, { useState, useEffect } from "react";
import { getEnterpriseOptions, getEnterprisePage } from "../../contentful";
import "./EnterpriseStyles.scss";
import { marked } from "marked";
import { FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";

interface PageContent {
  title?: string;
  subtitle?: string;
  description?: string;
  reasonsList?: [];
  bottomText?: string;
  ctaLabel?: string;
  optionsHeading?: string;
}
const Enterprise = () => {
  const [pageContent, setPageContent] = useState<PageContent>({});
  const [options, setOptions] = useState([]);
  useEffect(() => {
    getEnterpriseOptions().then((data) => setOptions(data));
    getEnterprisePage().then((data) => setPageContent(data));
  }, []);
  const { title, subtitle, description, reasonsList, bottomText, ctaLabel, optionsHeading } = pageContent;
  return (
    <div className='enterprise'>
      <h1 className='enterprise__title'>{title}</h1>
      <h3>{subtitle}</h3>
      {description && (
        <p className='enterprise__description' dangerouslySetInnerHTML={{ __html: marked(`${description}`) }} />
      )}
      <h2 className='enterprise__options-heading'>{optionsHeading}</h2>
      <div className='enterprise__options-container'>
        {options.map((o) => (
          <div className='enterprise__option'>
            <div className='enterprise__option-inner'>
              <div className='enterprise__option-header'>
                <h3 className='enterprise__option-title'>{o.title}</h3>
                {o.price && (
                  <span>
                    <span className='enterprise__option-price'> £{o.price}</span>{" "}
                    <span className='enterprise__option-billing'> {o.billing}</span>
                  </span>
                )}
                <span className='enterprise__option-subtitle'>{o.subtitle}</span>
                <span className='enterprise__option-desc'>{o.description}</span>
              </div>
              <ul className='enterprise__option-features'>
                <li className='enterprise__option-features-heading'>What's Included</li>
                {o.features.map((f) => (
                  <li className='enterprise__option-feature'>
                    <FaCheck size={15} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='enterprise__option-best-for'>
              <h3>Best for:</h3>
              <div dangerouslySetInnerHTML={{ __html: marked(o.bestFor) }} />
              <Link className='enterprise__link' to='/contact'>
                {o.ctaLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className='enterprise__bottom'>
        <h3>Why RESZEN8 for Enterprise?</h3>
        <ul>
          {reasonsList?.map((r) => (
            <li>{r}</li>
          ))}
        </ul>
        {bottomText && <div dangerouslySetInnerHTML={{ __html: marked(bottomText) }} />}
        <Link className='enterprise__link' to='/contact'>
          {ctaLabel}
        </Link>{" "}
      </div>
    </div>
  );
};

export default Enterprise;
