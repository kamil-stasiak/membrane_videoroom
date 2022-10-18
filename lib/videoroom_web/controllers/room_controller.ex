defmodule VideoRoomWeb.RoomController do
  use VideoRoomWeb, :controller

  @spec index(conn :: Plug.Conn.t(), params :: map()) :: Plug.Conn.t()
  def index(conn, %{"room_id" => id, "display_name" => _name}) do
    IO.puts "Index redirect"
    render(conn, "index.html", room_id: id)
  end

  # display name is not present, redirect to home page with filled in room name
  def index(conn, %{"room_id" => id} = params) do
    IO.puts "Index standard"
    params =
      if Map.get(params, "simulcast", "false") == "true",
        do: %{room_id: id, simulcast: true},
        else: %{room_id: id}

    redirect(conn, to: Routes.page_path(conn, :index, params))
  end

  @spec scrape(conn :: Plug.Conn.t(), params :: map()) :: Plug.Conn.t()
  def scrape(conn, %{"room_id" => id}) do
    IO.puts "Scrape"
    response =
      Membrane.TelemetryMetrics.Reporter.scrape(VideoRoomReporter)
      |> Map.get({:room_id, id})
      |> inspect(pretty: true, limit: :infinity)

    text(conn, response)
  end
end
