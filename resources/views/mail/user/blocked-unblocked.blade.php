<x-mail::message>
Hello {{ $user->name }},

@if($user->blocked_at)
Your account has been suspended. You are no longer able to login.
@else
Your account has been activated. You can now normally use the App.
<x-mail::button url="{{ route('login') }}">
Click here to login
</x-mail::button>
@endif
<br>

Thank you, <br>
{{ config('app.name')}}
</x-mail::message>





