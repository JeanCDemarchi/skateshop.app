const mockRegisterRootComponent = jest.fn();
const mockApp = function AppFicticio() {};

jest.mock('expo', () => ({
  registerRootComponent: mockRegisterRootComponent,
}));
jest.mock('./App', () => ({
  __esModule: true,
  default: mockApp,
}));

test('registra App como componente raiz', () => {
  require('./index');
  expect(mockRegisterRootComponent).toHaveBeenCalledWith(mockApp);
});
