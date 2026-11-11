import React from 'react';
import CheckboxFilter from './CheckboxFilter';

export default function CombinationFilter({label='Tổ hợp THPT của bạn',options,value,onChange}) {
  return <CheckboxFilter label={label} groups={[{key:'combinations',title:'Chọn một hoặc nhiều tổ hợp',options}]} value={{combinations:value}} onChange={next=>onChange(next.combinations)} emptyValue={{combinations:[]}} allLabel="Tất cả tổ hợp" help="Chương trình chỉ cần khớp ít nhất một tổ hợp đã chọn."/>;
}
