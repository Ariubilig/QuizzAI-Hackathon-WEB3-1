import { useNavigate } from 'react-router-dom';

export const useBackPage = (destination) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (destination) {
      navigate(destination);
    } else {
      navigate(-1);
    }
  };

  return goBack;
};
