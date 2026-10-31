import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from './context';
import './styles.css';
class ErrorBoundary extends React.Component {
  state={error:false};
  static getDerivedStateFromError(){return {error:true};}
  componentDidCatch(error){console.error(error);}
  render(){return this.state.error?<div className="startup"><h1>UniGate gặp sự cố hiển thị</h1><p>Dữ liệu đã lưu vẫn ở trong MySQL.</p><button className="button primary" onClick={()=>window.location.reload()}>Tải lại trang</button></div>:this.props.children;}
}
createRoot(document.getElementById('root')).render(<ErrorBoundary><Provider><App/></Provider></ErrorBoundary>);
