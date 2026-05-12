const AppButton = ({ type = 'button', className = '', style, onClick, children, ...rest }) => {
  return (
    <button type={type} className={`ui-button ${className}`.trim()} style={style} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

const AddButton = ({ className = 'btn btn-primary', ...props }) => <AppButton className={className} {...props} />;

const EditButton = ({ className = 'btn btn-edit', ...props }) => <AppButton className={className} {...props} />;

const DeleteButton = ({ className = 'btn btn-danger', ...props }) => <AppButton className={className} {...props} />;

const ViewExpensesButton = ({ className = 'btn btn-primary', ...props }) => <AppButton className={className} {...props} />;

export { AppButton, AddButton, EditButton, DeleteButton, ViewExpensesButton };
