import React from 'react';
// import { Button } from 'antd';
// import { EditorModal } from './EditorModal';
// import TestDataIframe from "./TestingData"

// Dummy data for testing the banner edit modal
// const dummyBannerData = {
//   heading: {
//     heading: {
//       id: 1,
//       subject: 'Welcome to our Newsletter',
//       preheader: 'Special offers inside!',
//       supporting_text: 'We have some exciting news and offers to share with you this month.',
//       closing: 'Thank you for being a valued customer.',
//       wait_time: 0,
//       cta: {
//         url: 'https://example.com/offers',
//         text: 'View Offers'
//       }
//     },
//     htmlcontent: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <h1 data="subject" style="color: #333;">Welcome to our Newsletter</h1>
//         <p data="preheader" style="color: #666;">Special offers inside!</p>
//         <div data="supporting_text" style="margin: 20px 0;">
//           We have some exciting news and offers to share with you this month.
//         </div>
//         <div id="button-heading" style="margin: 20px 0;">
//           <a href="https://example.com/offers" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
//             <p>View Offers</p>
//           </a>
//         </div>
//         <p data="closing" style="color: #666; font-style: italic;">
//           Thank you for being a valued customer.
//         </p>
//       </div>
//     `,
//     html_id: 'banner-heading-1'
//   },
//   frames: [
//     {
//       frame: {
//         id: 1,
//         wait_time: 0,
//         content: 'Check out our latest products!',
//         cta: {
//           url: 'https://example.com/products',
//           text: 'Shop Now'
//         }
//       },
//       htmlcontent: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//           <div style="display: flex; align-items: center;">
//             <div style="flex: 1;">
//               <div id="claim-1" style="font-size: 18px; margin-bottom: 15px;">
//                 Check out our latest products!
//               </div>
//               <div id="button-1">
//                 <a href="https://example.com/products" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
//                   <p>Shop Now</p>
//                 </a>
//               </div>
//             </div>
//             <div style="flex: 1; text-align: center;">
//               <div style="background-color: #f0f0f0; width: 200px; height: 200px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
//                 <span>Image Placeholder</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       `,
//       html_id: 'banner-frame-1'
//     }
//   ],
//   common: {
//     video: '',
//     references: [],
//     footnotes: []
//   }
// };

// Mock API function for saving banner data
// const mockSaveBannerApi = async (id: number, data: any) => {
//   console.log('Saving banner data:', { id, data });
//   // Simulate API response
//   return {
//     data: {
//       html: dummyBannerData.heading.htmlcontent
//     }
//   };
// };

const EditorModalTesting: React.FC = () => {
  // const [_, setModalOpen] = useState(false);

  // Mock function to handle asset updates
  // const handleSetAsset = (html: string, id: number) => {
  //   console.log('Asset updated:', { html, id });
  // };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      {/* <h1>Modal Test</h1>
      <Button
        type="primary"
        size="large"
        onClick={() => setModalOpen(true)}
      >
        Open Edit Modal
      </Button> */}

      {/* Banner Edit Modal */}

    </div>
  );
};

export default EditorModalTesting;
