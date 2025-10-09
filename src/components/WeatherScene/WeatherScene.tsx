import React from "react";
import "./styles.scss";
const AnimatedTree = () => {
  const leaves = [
    { className: "l1", transform: "translate(-50px,-20px)" },
    { className: "l2", transform: "translate(-30px,0)" },
    { className: "l3", transform: "translate(10px,-30px)" },
    { className: "l4", transform: "translate(-90px,-10px)" },
    { className: "l5", transform: "translate(0px,-60px)" },
  ];

  return (
    <>
      <div
        className='scene'
        aria-hidden='false'
        role='img'
        aria-label='A simple orange tree with subtle sway and falling leaves'
      >
        <svg
          viewBox='0 0 1200 800'
          width='100%'
          height='100%'
          preserveAspectRatio='xMidYMid slice'
          xmlns='http://www.w3.org/2000/svg'
          aria-hidden='true'
        >
          {/* Hills */}
          <g className='hills' transform='translate(0,380)'>
            <path
              d='M0 220 C200 120 400 140 600 220 C800 300 1000 260 1200 220 L1200 400 L0 400 Z'
              fill='var(--hill1)'
              opacity='0.98'
            />
            <path
              d='M0 260 C200 180 400 200 600 260 C800 320 1000 300 1200 260 L1200 400 L0 400 Z'
              fill='var(--hill2)'
              opacity='0.96'
            />
          </g>

          {/* Tree */}
          <g transform='translate(600,300)'>
            <g id='trunk' transform='translate(-40,0)'>
              <path
                d='M40 0 C60 80 72 180 52 260 C48 272 38 278 28 286 C18 294 6 298 0 296 C-6 294 -12 286 -10 270 C-8 250 6 136 18 80 C26 44 34 16 40 0 Z'
                fill='var(--trunk)'
              />
              <ellipse cx='14' cy='296' rx='60' ry='18' fill='#FF8A22' opacity='0.06' />
            </g>

            <g className='foliage' transform='translate(0,-160)'>
              {/* <ellipse cx='0' cy='110' rx='220' ry='120' fill='var(--foliage1)' /> */}
              {/* <ellipse cx='-70' cy='80' rx='90' ry='55' fill='var(--foliage1)' opacity='0.85' /> */}
              {/* <ellipse cx='80' cy='70' rx='95' ry='60' fill='var(--foliage2)' opacity='0.9' /> */}
              <path
                d='M -10 60 C -30 40 -70 20 -90 10'
                stroke='#A54810'
                strokeWidth='8'
                strokeLinecap='round'
                fill='none'
                opacity='0.9'
              />
              <path
                d='M -15 60 C -35 45 -90 20 -90 10'
                stroke='#A54810'
                strokeWidth='8'
                strokeLinecap='round'
                fill='none'
                opacity='0.9'
              />
              <path
                d='M 10 60 C 40 40 80 20 110 10'
                stroke='#A54810'
                strokeWidth='8'
                strokeLinecap='round'
                fill='none'
                opacity='0.9'
              />
            </g>
          </g>

          {/* Ground leaves */}
          <g transform='translate(420,660)' fill='var(--leaf)' opacity='0.85'>
            <ellipse cx='0' cy='0' rx='16' ry='8' transform='rotate(-20)' />
            <ellipse cx='80' cy='-10' rx='18' ry='9' transform='rotate(8)' />
            <ellipse cx='180' cy='6' rx='14' ry='7' transform='rotate(0)' />
          </g>
        </svg>

        {/* Falling leaves */}
        {leaves.map((leaf, i) => (
          <div key={i} className={`leaf ${leaf.className}`} style={{ transform: leaf.transform }}>
            <svg viewBox='0 0 16 12' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
              <path d='M6 0 C10 -1 14 2 12 6 C10 9 6 10 3 8 C1 6 1 2 6 0 Z' fill='var(--leaf)' />
            </svg>
          </div>
        ))}

        <div className='caption'>Gentle autumn sway — pure HTML + CSS + SVG</div>
      </div>
    </>
  );
};

export default AnimatedTree;
