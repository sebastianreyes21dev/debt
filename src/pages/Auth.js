import { supabase } from '../utils/supabase.js';
import { toast } from '../components/toast.js';

export function render(container) {
  container.innerHTML = `
    <main class="auth-page">
      <section class="auth-card">
        <h1 class="app-logo">Deudas<span>App</span></h1>
        <p class="auth-copy">Ingresa para consultar tus deudas desde cualquier dispositivo.</p>
        <form id="auth-form" class="card-form">
          <div class="form-group"><label for="auth-email">Correo</label><input id="auth-email" type="email" autocomplete="email" required></div>
          <div class="form-group"><label for="auth-password">Contraseña</label><input id="auth-password" type="password" autocomplete="current-password" minlength="8" required></div>
          <button class="btn btn-primary btn-block" type="submit">Iniciar sesión</button>
          <button class="btn btn-ghost btn-block" type="button" id="signup-btn">Crear cuenta</button>
          <button class="btn btn-ghost btn-block" type="button" id="reset-password-btn">Olvidé mi contraseña</button>
        </form>
      </section>
    </main>`;

  const form = container.querySelector('#auth-form');
  const email = container.querySelector('#auth-email');
  const password = container.querySelector('#auth-password');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: email.value.trim(), password: password.value });
    if (error) toast(error.message, 'error');
  });
  container.querySelector('#signup-btn').addEventListener('click', async () => {
    const { error } = await supabase.auth.signUp({ email: email.value.trim(), password: password.value });
    if (error) toast(error.message, 'error');
    else toast('Cuenta creada. Revisa tu correo para confirmarla.', 'success', 5000);
  });
  container.querySelector('#reset-password-btn').addEventListener('click', async () => {
    if (!email.value.trim()) {
      toast('Escribe tu correo para enviarte el enlace de recuperación.', 'error');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: window.location.origin });
    if (error) toast(error.message, 'error');
    else toast('Revisa tu correo para restablecer la contraseña.', 'success', 5000);
  });
}
