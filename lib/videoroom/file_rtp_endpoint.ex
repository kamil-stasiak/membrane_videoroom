defmodule Videoroom.Room.FileRTPEndpoint do
  @moduledoc false

  # Endpoint that publishes data from a file. It will start publishing data when it receives message :start.

  use Membrane.Bin

  alias Membrane.RTC.Engine
  alias Membrane.H264
  require Membrane.Logger

  @type encoding_t() :: String.t()

  def_options(
    rtc_engine: [
      spec: pid(),
      description: "Pid of parent Engine"
    ],
    file_path: [
      spec: Path.t(),
      description: "Path to track file"
    ],
    track: [
      spec: Engine.Track.t(),
      description: "Track to publish"
    ],
    owner: [
      spec: pid(),
      description: "Owner pid"
    ]
  )

  def_output_pad(:output,
    demand_unit: :buffers,
    caps: :any,
    availability: :on_request
  )

  @impl true
  def handle_init(opts) do
    state = %{
      rtc_engine: opts.rtc_engine,
      file_path: opts.file_path,
      track: opts.track,
      owner: opts.owner
    }

    {:ok, state}
  end

  @impl true
  def handle_prepared_to_playing(_ctx, state) do
    IO.inspect(:publish_new_tracks)
    {{:ok, notify: {:publish, {:new_tracks, [state.track]}}}, state}
  end

  @impl true
  def handle_process(Pad.ref(:output, pad), %Membrane.Buffer{} = buffer, ctx, state) do
    IO.inspect(buffer, :buffer)

    {{:ok, forward: buffer}, state}
  end

  @impl true
  def handle_pad_added(Pad.ref(:output, {track_id, _rid}) = pad, _ctx, state) do
    spec = %ParentSpec{
      children: %{
        source: %Membrane.File.Source{
          location: state.file_path
        },
        parser: %Membrane.H264.FFmpeg.Parser{
          framerate: {24, 1},
          alignment: :nal
        },
        payloader_bin: %Membrane.RTP.PayloaderBin{
          payloader: Membrane.RTP.H264.Payloader,
          ssrc: 10,
          payload_type: state.track.fmtp.pt,
          clock_rate: 90_000
        },
        # rtp: %Membrane.RTP.SessionBin{},
        realtimer: Membrane.Realtimer
      },
      links: [
        link(:source)
        |> to(:parser)
        |> to(:realtimer)
        |> to(:payloader_bin)
        # |> via_in(Pad.ref(:input, 10), options: [payloader: Membrane.RTP.H264.Payloader])
        # |> to(:rtp)
        # |> via_out(Pad.ref(:output, 10),
        #   options: [
        #     depayloader: nil,
        #     encoding: :H264,
        #     clock_rate: 90_000
        #   ]
        # )
        |> to_bin_output(pad)
      ]
    }

    {{:ok, spec: spec}, state}
  end

  @impl true
  def handle_other({:new_tracks, webrtc_tracks}, _ctx, state) do
    send(state.owner, {:tracks_added, self()})
    {:ok, state}
  end

  @impl true
  def handle_other({:remove_tracks, []}, _ctx, state) do
    {:ok, state}
  end

  @impl true
  def handle_other(:start, _ctx, state) do
    IO.inspect("Received :start")
    {{:ok, notify: {:track_ready, state.track.id, nil, state.track.encoding, nil}}, state}
  end
end
