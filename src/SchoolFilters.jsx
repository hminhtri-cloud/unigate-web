import React from 'react';
import CheckboxFilter from './CheckboxFilter';
import {emptySchoolFilters} from '../shared/domain.mjs';

export default function SchoolFilters({value,onChange}) {
  const groups=[
    {key:'area',title:'Theo khu vực',options:[{value:'hcm',label:'TP.HCM'},{value:'cantho',label:'Cần Thơ'},{value:'south',label:'Miền Nam'}]},
    {key:'level',title:'Theo bậc đào tạo',options:[{value:'university',label:'Đại học / Học viện'},{value:'college',label:'Cao đẳng'}]},
    {key:'system',title:'Theo hệ thống',options:[{value:'vnu-hcm',label:'Đại học Quốc gia TP.HCM'},{value:'ctu',label:'Đại học Cần Thơ'},{value:'other',label:'Khác'}]},
    {key:'type',title:'Theo loại hình',options:[{value:'public',label:'Trường công'},{value:'private',label:'Tư thục'}]},
  ];
  return <CheckboxFilter label="Nhóm trường" groups={groups} value={value} onChange={onChange} emptyValue={emptySchoolFilters} allLabel="Tất cả nhóm trường" help="Cùng nhóm: chọn một trong các mục. Khác nhóm: kết hợp điều kiện. Miền Nam bao gồm TP.HCM và Cần Thơ."/>;
}
