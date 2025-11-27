export default function Countdown({ onFinish }) {
  const [n, setN] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setN(prev => {
        if (prev === 1) {
          clearInterval(interval);
          onFinish();
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  return <h1>{n}</h1>;
}