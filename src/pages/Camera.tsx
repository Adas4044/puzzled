// import { useNavigate } from "react-router-dom";
// import CameraCapture from "../components/CameraCapture";

// export default function CameraPage() {
//   const navigate = useNavigate();
//   const stepId = 1;

//   function handleCaptured(imageSrc: string) {
//     navigate("/preview", { state: { stepId, imageSrc } });
//   }

//   return (
//     <div style={{ maxWidth: 420, margin: "24px auto", padding: 16 }}>
//       <h2>Step {stepId}</h2>

//       <CameraCapture
//         stepId={stepId}
//         onCaptured={handleCaptured}
//       />
//     </div>
//   );
// }
