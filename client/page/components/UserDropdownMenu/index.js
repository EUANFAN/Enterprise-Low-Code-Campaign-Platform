import React from 'react';
import HELink from 'components/HELink';

import './index.less';

export default function UserDropdownMenu(props) {
  const { secondary, userId, onClick, onLogOut } = props;

  return (
    <div className="user-dropdown-menu">
      <HELink
        className="user-dropdown-menu__trigger"
        onClick={onClick}
        secondary={secondary}
      >
        <div className="user-dropdown-menu__trigger__text">{userId}</div>
      </HELink>
      <ul className="user-dropdown-menu__actions">
        <li className="user-dropdown-menu__actions__item" onClick={onLogOut}>
          {/* {'退出登录'} */}
        </li>
      </ul>
    </div>
  );
}
