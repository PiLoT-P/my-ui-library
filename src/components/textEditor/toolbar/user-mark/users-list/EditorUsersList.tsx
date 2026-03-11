import useDebounce from '@src/lib/hooks/useDebounce';
import { fethcGetUsersAndGroups } from '@src/lib/requests/identity/participants.requests';
import { useQuery } from '@tanstack/react-query';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { IMembersUG } from '@lib/interfaces/defaults.intefaces';
import UserAvatar from '@components/customComponents/user-group/user-avatar/UserAvatar';
import s from './EditorUsersList.module.scss';
import { createUserLink } from '@components/customComponents/textEditor/utils/utils-functions';
import LoaderMUI from '@components/customComponents/loaderMUI/LoaderMUI';
import IconButton from '@components/customComponents/uiElelments/button/IconButton';

interface EditorUsersListProps{
  addUserMarker: (link: string, user?: IMembersUG) => void;
  closeModal: () => void;
}

function EditorUsersList({
  addUserMarker,
  closeModal,
}: EditorUsersListProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState<IMembersUG | null>(null);

  const debouncedUser = useDebounce(searchText, 1000);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const userRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const {
    data: users,
    isLoading: isUsersLoading,
    isSuccess: isUsersSuccess,
    isError: isUsersError,
  } = useQuery<IMembersUG[]>({
    queryKey: ['users', debouncedUser],
    queryFn: () => fethcGetUsersAndGroups(searchText, [1]),
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const handleCreateUserLink = (user: IMembersUG) => {
    if (user.type === 1) {
      const [lastName, firstName] = user.name.split(' ');
      const buttonHTML = createUserLink({
        ...user,
        firstName,
        lastName,
      });
      addUserMarker(buttonHTML, user)
    }
  }

  useEffect(() => {
    if (isUsersLoading) {
      setIsLoading(true);
    }
    if (isUsersSuccess) {
      setIsLoading(false);
      setSelectedIndex(0);
      if (users.length > 0) setSelectedUser(users[0]);
    }
    if (isUsersError) {
      setIsLoading(false);
    }
  }, [isUsersLoading, isUsersSuccess, isUsersError, users])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [])

  const handleKeyboardClick = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!users || users.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % users.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedUser) {
        handleCreateUserLink(selectedUser);
      }
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();
      closeModal();
    }
  };

  useEffect(() => {
    if (users && users.length > 0) {
      setSelectedUser(users[selectedIndex]);
    }
  }, [selectedIndex, users]);

  useEffect(() => {
    const selectedRef = userRefs.current[selectedIndex];
    if (selectedRef) {
      selectedRef.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  return (
    <div
      className={s.container}
    >
      {isLoading && <LoaderMUI />}
      <input
        type='text'
        ref={inputRef}
        value={searchText}
        placeholder='Пошук'
        onChange={(e) => {
          setSearchText(e.target.value);
        }}
        onKeyDown={handleKeyboardClick}
        className={s.text_field}
      />
      {(!users || users.length < 1) && <p className={s.notFind}>Не знайшло</p>}
      {(users && isUsersSuccess) && (
        <ul className={s.users_list}>
          {users.map((user, index) => (
            <li key={index}>
              <button
                type='button'
                ref={(el) => { userRefs.current[index] = el }}
                onClick={() => {
                  handleCreateUserLink(user);
                }}
                className={`
                  ${s.btn_user}
                  ${selectedUser?.id === user.id ? s.btn_user_selected : ''}
                `}
              >
                <UserAvatar
                  avatarIcon={user.image}
                />
                <p>{user.name}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
      <IconButton
        icon='cancel'
        className={s.btn_close}
        onClick={closeModal}
        size={26}
      />
    </div>
  );
}

export default EditorUsersList;
