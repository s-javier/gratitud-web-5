<script lang="ts">
  // Puedes añadir lógica aquí si es necesario en el futuro
</script>

<div
  class="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-100 to-yellow-200 p-8 text-center"
>
  <!-- Botón de Ingresar en la esquina superior derecha -->
  <div class="absolute top-4 right-4 z-10">
    <a
      href="/ingreso"
      class="focus:ring-opacity-75 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white
      shadow-md transition duration-300 ease-in-out hover:bg-orange-600 focus:ring-2
      focus:ring-orange-400 focus:outline-none"
    >
      Ingresar
    </a>
  </div>

  <header class="mb-12 pt-10">
    <!-- Añadido padding top para que el botón no solape el título en pantallas pequeñas -->
    <h1 class="mb-4 text-5xl font-bold text-orange-700">Cultiva tu Gratitud Diaria</h1>
    <p class="text-xl text-gray-600">
      Un espacio simple para registrar tus agradecimientos y recordar la belleza de cada día.
    </p>
  </header>

  <main class="max-w-2xl">
    <section class="mb-10">
      <h2 class="mb-3 text-3xl font-semibold text-orange-600">¿Por qué Gratitud?</h2>
      <p class="text-lg leading-relaxed text-gray-700">
        Practicar la gratitud regularmente puede transformar tu perspectiva, mejorar tu bienestar y
        ayudarte a apreciar las pequeñas cosas de la vida. Nuestro sistema te facilita incorporar
        este hábito poderoso en tu rutina diaria.
      </p>
    </section>

    <section class="mb-10">
      <h2 class="mb-3 text-3xl font-semibold text-orange-600">Características</h2>
      <ul class="list-none space-y-2 text-lg text-gray-700">
        <li>📝 Registra fácilmente aquello por lo que estás agradecido.</li>
        <li>🔔 Recibe recordatorios diarios para no olvidar tu práctica.</li>
        <li>📖 Revisa tus entradas pasadas y observa tu crecimiento.</li>
        <li>🔒 Seguro y privado: tus pensamientos son solo tuyos.</li>
      </ul>
    </section>

    <section>
      <p class="mb-6 text-lg text-gray-700">Empieza hoy mismo a construir un hábito de gratitud.</p>
      <!-- Puedes añadir botones de acción aquí, por ejemplo: -->
      <!--
      <div class="space-x-4">
        <a href="/registro" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
          Regístrate Gratis
        </a>
        <a href="/login" class="bg-transparent hover:bg-orange-100 text-orange-600 font-semibold py-3 px-6 border border-orange-500 rounded-lg transition duration-300">
          Iniciar Sesión
        </a>
      </div>
      -->
      <p class="mt-8 text-sm text-gray-500">
        (Próximamente: enlaces de registro e inicio de sesión)
      </p>
    </section>
  </main>

  <footer class="mt-16 text-sm text-gray-500">
    © {new Date().getFullYear()} Tu App de Gratitud. Todos los derechos reservados.
  </footer>
</div>

<!-- Eliminado el contenido extra que estaba fuera del div principal -->
<!--
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<p class="text-lg">
  Ir a
  <a
    href="/uno"
    class="font-medium text-blue-600 underline transition-colors duration-200 hover:text-blue-800 hover:no-underline"
  >
    Uno
  </a>
  .
</p>
-->
<style>
  /* Puedes añadir estilos globales o específicos aquí si Tailwind no es suficiente */
</style>
