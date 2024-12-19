import { Routes, Route } from 'react-router-dom';
import Documents from './Documents';

export const DocumentsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Documents />} />
    </Routes>
  );
};

export default DocumentsRoutes;
